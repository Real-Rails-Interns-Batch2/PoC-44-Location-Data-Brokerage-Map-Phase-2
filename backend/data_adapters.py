"""
Real Rails PoC 44 — Data Adapters
Synthetic mock data: vendor relationships, SDKs, downstream buyers.
All data is clearly labeled as synthetic/mock for demo purposes.

FIX: policy_flags_count is now the count of flags FOR THAT ENTITY ONLY,
     not a cumulative sum. Summary total is computed separately.
"""

from typing import List, Dict, Any
import pandas as pd


# ---------------------------------------------------------------------------
# POLICY FLAGS (defined first so entity counts can reference them)
# ---------------------------------------------------------------------------

_POLICY_FLAGS = [
    {
        "id": "PF001", "entity_id": "E001", "entity_name": "Veridian Data Co.",
        "source": "FTC", "year": 2023,
        "flag_type": "investigation", "severity": "critical",
        "summary": "Open Section 5 investigation into deceptive consent practices in SDK partner agreements.",
    },
    {
        "id": "PF002", "entity_id": "E001", "entity_name": "Veridian Data Co.",
        "source": "CFPB", "year": 2022,
        "flag_type": "advisory", "severity": "elevated",
        "summary": "Named in CFPB advisory on data brokers supplying location data to debt collectors.",
    },
    {
        "id": "PF003", "entity_id": "E009", "entity_name": "National Recovery Group",
        "source": "CFPB", "year": 2024,
        "flag_type": "enforcement_action", "severity": "critical",
        "summary": "Consent order: prohibited from purchasing real-time location data for debt collection purposes.",
    },
    {
        "id": "PF004", "entity_id": "E011", "entity_name": "PrecisionVote LLC",
        "source": "FEC", "year": 2024,
        "flag_type": "disclosure_gap", "severity": "critical",
        "summary": "Location data used for targeting at reproductive health clinics; FEC disclosure gap.",
    },
    {
        "id": "PF005", "entity_id": "E010", "entity_name": "InsureMetrics LLC",
        "source": "CFPB", "year": 2023,
        "flag_type": "inquiry", "severity": "elevated",
        "summary": "CFPB inquiry into whether mobility-based underwriting violates FCRA adverse action notice rules.",
    },
]

# Build a lookup: entity_id → count of flags for that entity
_FLAG_COUNTS: Dict[str, int] = {}
for _f in _POLICY_FLAGS:
    _FLAG_COUNTS[_f["entity_id"]] = _FLAG_COUNTS.get(_f["entity_id"], 0) + 1


def get_policy_flags() -> List[Dict[str, Any]]:
    return _POLICY_FLAGS


# ---------------------------------------------------------------------------
# ENTITIES
# ---------------------------------------------------------------------------

def get_entities() -> List[Dict[str, Any]]:
    return [
        # ── Tier 1: Brokers ──
        {
            "id": "E001", "name": "Veridian Data Co.", "category": "broker",
            "subcategory": "aggregator", "hq_state": "VA",
            "location_granularity": "precise",
            "use_cases": ["insurance_underwriting", "hedge_fund_alpha", "law_enforcement"],
            "data_volume_monthly_tb": 420, "risk_score": 9.2,
            "policy_flags_count": _FLAG_COUNTS.get("E001", 0),   # ← 2
            "cfpb_actions": 2,
            "lobbying_spend_2023_usd": 3_800_000,
            "revenue_est_m": 890,
            "description": "Largest independent aggregator; resells to 200+ downstream buyers.",
        },
        {
            "id": "E002", "name": "Prism Location Inc.", "category": "broker",
            "subcategory": "aggregator", "hq_state": "TX",
            "location_granularity": "precise",
            "use_cases": ["retail_analytics", "political_targeting", "debt_collection"],
            "data_volume_monthly_tb": 310, "risk_score": 8.7,
            "policy_flags_count": _FLAG_COUNTS.get("E002", 0),   # ← 0
            "cfpb_actions": 1,
            "lobbying_spend_2023_usd": 2_100_000,
            "revenue_est_m": 640,
            "description": "Specialises in real-time bid-stream data from 4,000+ SDK partners.",
        },
        {
            "id": "E003", "name": "ClearPath Analytics", "category": "broker",
            "subcategory": "enricher", "hq_state": "NY",
            "location_granularity": "neighborhood",
            "use_cases": ["credit_scoring", "fraud_detection", "healthcare"],
            "data_volume_monthly_tb": 180, "risk_score": 6.8,
            "policy_flags_count": _FLAG_COUNTS.get("E003", 0),
            "cfpb_actions": 1,
            "lobbying_spend_2023_usd": 950_000,
            "revenue_est_m": 320,
            "description": "Enriches credit bureau feeds with mobility patterns.",
        },
        {
            "id": "E004", "name": "Meridian Signals", "category": "broker",
            "subcategory": "aggregator", "hq_state": "CA",
            "location_granularity": "precise",
            "use_cases": ["advertising", "retail_analytics", "hedge_fund_alpha"],
            "data_volume_monthly_tb": 560, "risk_score": 7.4,
            "policy_flags_count": _FLAG_COUNTS.get("E004", 0),
            "cfpb_actions": 0,
            "lobbying_spend_2023_usd": 1_700_000,
            "revenue_est_m": 1_100,
            "description": "Ad-tech origin; pivoted into financial intelligence market 2021.",
        },
        # ── Tier 2: SDK Vendors ──
        {
            "id": "E005", "name": "PulseSDK", "category": "sdk_vendor",
            "subcategory": "mobile_sdk", "hq_state": "CA",
            "location_granularity": "precise",
            "use_cases": ["advertising", "app_analytics"],
            "data_volume_monthly_tb": 890, "risk_score": 8.1,
            "policy_flags_count": _FLAG_COUNTS.get("E005", 0),
            "cfpb_actions": 0,
            "lobbying_spend_2023_usd": 0,
            "revenue_est_m": 210,
            "description": "Embedded in 47,000 apps; collects background location every 90s.",
        },
        {
            "id": "E006", "name": "HorizonKit", "category": "sdk_vendor",
            "subcategory": "mobile_sdk", "hq_state": "WA",
            "location_granularity": "precise",
            "use_cases": ["advertising", "retail_analytics"],
            "data_volume_monthly_tb": 640, "risk_score": 7.9,
            "policy_flags_count": _FLAG_COUNTS.get("E006", 0),
            "cfpb_actions": 0,
            "lobbying_spend_2023_usd": 0,
            "revenue_est_m": 155,
            "description": "Weather & utility app SDK disguise; primary broker: Veridian (exclusive).",
        },
        {
            "id": "E007", "name": "GeoFence Pro", "category": "sdk_vendor",
            "subcategory": "geofencing", "hq_state": "FL",
            "location_granularity": "precise",
            "use_cases": ["retail_analytics", "political_targeting"],
            "data_volume_monthly_tb": 230, "risk_score": 6.3,
            "policy_flags_count": _FLAG_COUNTS.get("E007", 0),
            "cfpb_actions": 0,
            "lobbying_spend_2023_usd": 0,
            "revenue_est_m": 78,
            "description": "Geofencing-as-a-service; sells enriched visit data upstream.",
        },
        # ── Tier 3: Buyers ──
        {
            "id": "E008", "name": "Apex Capital Strategies", "category": "buyer",
            "subcategory": "hedge_fund", "hq_state": "CT",
            "location_granularity": "neighborhood",
            "use_cases": ["hedge_fund_alpha"],
            "data_volume_monthly_tb": 42, "risk_score": 4.2,
            "policy_flags_count": _FLAG_COUNTS.get("E008", 0),
            "cfpb_actions": 0,
            "lobbying_spend_2023_usd": 0,
            "revenue_est_m": None,
            "description": "Quantitative fund; uses foot-traffic data for retail stock signals.",
        },
        {
            "id": "E009", "name": "National Recovery Group", "category": "buyer",
            "subcategory": "debt_collector", "hq_state": "GA",
            "location_granularity": "precise",
            "use_cases": ["debt_collection"],
            "data_volume_monthly_tb": 18, "risk_score": 8.9,
            "policy_flags_count": _FLAG_COUNTS.get("E009", 0),   # ← 1
            "cfpb_actions": 3,
            "lobbying_spend_2023_usd": 480_000,
            "revenue_est_m": 340,
            "description": "Uses real-time location pings to serve process papers and locate debtors.",
        },
        {
            "id": "E010", "name": "InsureMetrics LLC", "category": "buyer",
            "subcategory": "insurance", "hq_state": "IL",
            "location_granularity": "neighborhood",
            "use_cases": ["insurance_underwriting"],
            "data_volume_monthly_tb": 67, "risk_score": 6.1,
            "policy_flags_count": _FLAG_COUNTS.get("E010", 0),   # ← 1
            "cfpb_actions": 1,
            "lobbying_spend_2023_usd": 1_200_000,
            "revenue_est_m": 820,
            "description": "Mobility patterns feed into home/auto premium models.",
        },
        {
            "id": "E011", "name": "PrecisionVote LLC", "category": "buyer",
            "subcategory": "political", "hq_state": "DC",
            "location_granularity": "precise",
            "use_cases": ["political_targeting"],
            "data_volume_monthly_tb": 29, "risk_score": 9.5,
            "policy_flags_count": _FLAG_COUNTS.get("E011", 0),   # ← 1
            "cfpb_actions": 0,
            "lobbying_spend_2023_usd": 0,
            "revenue_est_m": 95,
            "description": "Targets voters at polling locations, places of worship, clinics.",
        },
        {
            "id": "E012", "name": "HealthPath Analytics", "category": "buyer",
            "subcategory": "healthcare", "hq_state": "MA",
            "location_granularity": "precise",
            "use_cases": ["healthcare"],
            "data_volume_monthly_tb": 38, "risk_score": 7.8,
            "policy_flags_count": _FLAG_COUNTS.get("E012", 0),
            "cfpb_actions": 0,
            "lobbying_spend_2023_usd": 670_000,
            "revenue_est_m": 190,
            "description": "Infers clinic visits, addiction treatment attendance from mobility.",
        },
        # ── Tier 4: Regulators ──
        {
            "id": "E013", "name": "CFPB", "category": "regulator",
            "subcategory": "federal", "hq_state": "DC",
            "location_granularity": None,
            "use_cases": ["enforcement"],
            "data_volume_monthly_tb": 0, "risk_score": 0,
            "policy_flags_count": 0,
            "cfpb_actions": 0,
            "lobbying_spend_2023_usd": 0,
            "revenue_est_m": None,
            "description": "Issued 2024 advisory on data brokers in credit/debt context.",
        },
        {
            "id": "E014", "name": "FTC", "category": "regulator",
            "subcategory": "federal", "hq_state": "DC",
            "location_granularity": None,
            "use_cases": ["enforcement"],
            "data_volume_monthly_tb": 0, "risk_score": 0,
            "policy_flags_count": 0,
            "cfpb_actions": 0,
            "lobbying_spend_2023_usd": 0,
            "revenue_est_m": None,
            "description": "FTC Act Section 5 enforcement on deceptive data practices.",
        },
    ]


# ---------------------------------------------------------------------------
# RELATIONSHIPS
# ---------------------------------------------------------------------------

def get_relationships() -> List[Dict[str, Any]]:
    return [
        {"id": "R001", "source": "E005", "target": "E001", "type": "data_feed",
         "volume_tb_monthly": 320, "contract_type": "revenue_share",
         "label": "Bid-stream + background GPS"},
        {"id": "R002", "source": "E005", "target": "E002", "type": "data_feed",
         "volume_tb_monthly": 210, "contract_type": "revenue_share",
         "label": "Raw location pings"},
        {"id": "R003", "source": "E006", "target": "E001", "type": "data_feed",
         "volume_tb_monthly": 640, "contract_type": "exclusive_supply",
         "label": "Exclusive supply agreement"},
        {"id": "R004", "source": "E007", "target": "E002", "type": "data_feed",
         "volume_tb_monthly": 230, "contract_type": "api_license",
         "label": "Geofence visit events"},
        {"id": "R005", "source": "E005", "target": "E004", "type": "data_feed",
         "volume_tb_monthly": 180, "contract_type": "resale",
         "label": "Enriched device graph"},
        {"id": "R006", "source": "E001", "target": "E008", "type": "sale",
         "volume_tb_monthly": 42, "contract_type": "subscription",
         "label": "Foot-traffic intelligence feed"},
        {"id": "R007", "source": "E001", "target": "E009", "type": "sale",
         "volume_tb_monthly": 18, "contract_type": "pay_per_query",
         "label": "Real-time locate requests"},
        {"id": "R008", "source": "E002", "target": "E011", "type": "sale",
         "volume_tb_monthly": 29, "contract_type": "subscription",
         "label": "Voter movement profiles"},
        {"id": "R009", "source": "E002", "target": "E012", "type": "sale",
         "volume_tb_monthly": 38, "contract_type": "subscription",
         "label": "Clinic & pharmacy visits"},
        {"id": "R010", "source": "E003", "target": "E010", "type": "sale",
         "volume_tb_monthly": 67, "contract_type": "api_license",
         "label": "Mobility-enriched credit model"},
        {"id": "R011", "source": "E004", "target": "E008", "type": "sale",
         "volume_tb_monthly": 55, "contract_type": "subscription",
         "label": "Retail earnings signals"},
        {"id": "R012", "source": "E001", "target": "E003", "type": "exchange",
         "volume_tb_monthly": 90, "contract_type": "cross_license",
         "label": "Cross-license: precise→enriched"},
        {"id": "R013", "source": "E004", "target": "E002", "type": "exchange",
         "volume_tb_monthly": 120, "contract_type": "cross_license",
         "label": "Device graph enrichment swap"},
        {"id": "R014", "source": "E013", "target": "E009", "type": "enforcement",
         "volume_tb_monthly": 0, "contract_type": "regulatory",
         "label": "CFPB action: debt collection location use"},
        {"id": "R015", "source": "E013", "target": "E010", "type": "enforcement",
         "volume_tb_monthly": 0, "contract_type": "regulatory",
         "label": "CFPB inquiry: insurance underwriting"},
        {"id": "R016", "source": "E014", "target": "E001", "type": "enforcement",
         "volume_tb_monthly": 0, "contract_type": "regulatory",
         "label": "FTC Section 5 investigation (open)"},
    ]


# ---------------------------------------------------------------------------
# SDK LINEAGE
# ---------------------------------------------------------------------------

def get_sdk_lineage() -> List[Dict[str, Any]]:
    return [
        {
            "sdk": "PulseSDK (E005)", "apps_count": 47000,
            "sample_apps": ["FlashWeather", "CityBike Tracker", "Budget Grocery"],
            "data_collected": "GPS coordinates every 90s, foreground + background",
            "consent_mechanism": "Buried in ToS paragraph 14b",
            "flows_to_broker": "Veridian (E001), Prism (E002), Meridian (E004)",
            "downstream_buyers": ["Apex Capital (E008)", "National Recovery Group (E009)", "PrecisionVote (E011)"],
            "risk_note": "Background collection persists after app close; no opt-out mechanism.",
        },
        {
            "sdk": "HorizonKit (E006)", "apps_count": 31000,
            "sample_apps": ["Storm Alert Pro", "ElectricMap", "LocalNews Now"],
            "data_collected": "GPS + WiFi triangulation, 2-min intervals",
            "consent_mechanism": "Location permission prompt only; broker relationship not disclosed",
            "flows_to_broker": "Veridian Data Co. (E001) — exclusive contract",
            "downstream_buyers": ["Apex Capital (E008)", "InsureMetrics (E010)"],
            "risk_note": "Exclusive supply agreement: single point of broker control.",
        },
        {
            "sdk": "GeoFence Pro (E007)", "apps_count": 8500,
            "sample_apps": ["RetailRewards", "ShopNearby"],
            "data_collected": "Geofence entry/exit events with dwell time",
            "consent_mechanism": "In-app reward exchange ('share location for coupons')",
            "flows_to_broker": "Prism Location Inc. (E002)",
            "downstream_buyers": ["PrecisionVote LLC (E011)", "HealthPath Analytics (E012)"],
            "risk_note": "Dwell time at clinics, places of worship inferred from geofence events.",
        },
    ]


# ---------------------------------------------------------------------------
# SUMMARY METRICS
# ---------------------------------------------------------------------------

def get_summary_metrics() -> Dict[str, Any]:
    entities = get_entities()
    df = pd.DataFrame(entities)

    brokers  = df[df["category"] == "broker"]
    sdks     = df[df["category"] == "sdk_vendor"]
    buyers   = df[df["category"] == "buyer"]

    total_tb        = int(df["data_volume_monthly_tb"].sum()) if not df.empty else 0
    avg_risk_val    = brokers["risk_score"].mean()
    avg_risk        = round(float(avg_risk_val), 1) if pd.notna(avg_risk_val) else 0.0
    # ← FIXED: sum of per-entity flag counts, not double-counted
    total_flags     = int(df["policy_flags_count"].sum()) if not df.empty else 0
    total_lobbying  = int(df["lobbying_spend_2023_usd"].sum()) if not df.empty else 0
    highest_risk    = df.loc[df["risk_score"].idxmax(), "name"] if not df.empty and not brokers.empty else "N/A"

    return {
        "poc_id": 44,
        "rail":  "Distribution & Demand",
        "title": "Location Data Brokerage Map",
        "metric_headline": f"{total_tb // 1000}+ PB/month in circulation",
        "metric_subtext":  "Across tracked broker-SDK network",
        "broker_count":         len(brokers),
        "sdk_vendor_count":     len(sdks),
        "buyer_count":          len(buyers),
        "total_monthly_tb":     total_tb,
        "avg_broker_risk_score": avg_risk,
        "total_policy_flags":   total_flags,          # ← now 5, not 20
        "total_lobbying_2023_usd": total_lobbying,
        "highest_risk_entity":  highest_risk,
        "apps_instrumented_est": 86500,
        "why_this_matters": (
            "Location data flows silently from 86,000+ apps through a small cartel of brokers "
            "to hedge funds, debt collectors, insurers, and political campaigns — "
            "with consent buried in legalese and no meaningful opt-out."
        ),
        "who_controls_the_rail": (
            "Three broker intermediaries — Veridian, Prism, and Meridian — control over 70% of "
            "the US precise-location data market, operating largely beyond FCRA/HIPAA scope while "
            "lobbying aggressively to prevent federal data privacy legislation."
        ),
    }
