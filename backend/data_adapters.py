"""
Real Rails PoC 44 — Data Adapters
Reads from static JSON files in backend/data/.
"""

import json
from pathlib import Path
from typing import List, Dict, Any
import pandas as pd

DATA_DIR = Path(__file__).parent / "data"


def _load(filename: str) -> Any:
    with open(DATA_DIR / filename, "r", encoding="utf-8") as f:
        return json.load(f)


def get_policy_flags() -> List[Dict[str, Any]]:
    return _load("policy_flags.json")


def get_entities() -> List[Dict[str, Any]]:
    entities = _load("entities.json")
    flags = get_policy_flags()

    # Build flag count per entity from policy_flags.json (single source of truth)
    flag_counts: Dict[str, int] = {}
    for f in flags:
        flag_counts[f["entity_id"]] = flag_counts.get(f["entity_id"], 0) + 1

    for e in entities:
        e["policy_flags_count"] = flag_counts.get(e["id"], 0)

    return entities


def get_relationships() -> List[Dict[str, Any]]:
    return _load("relationships.json")


def get_sdk_lineage() -> List[Dict[str, Any]]:
    return _load("sdk_lineage.json")


def get_summary_metrics() -> Dict[str, Any]:
    entities = get_entities()
    df = pd.DataFrame(entities)

    brokers = df[df["category"] == "broker"]
    sdks    = df[df["category"] == "sdk_vendor"]
    buyers  = df[df["category"] == "buyer"]

    total_tb       = int(df["data_volume_monthly_tb"].sum()) if not df.empty else 0
    avg_risk_val   = brokers["risk_score"].mean()
    avg_risk       = round(float(avg_risk_val), 1) if pd.notna(avg_risk_val) else 0.0
    total_flags    = int(df["policy_flags_count"].sum()) if not df.empty else 0
    total_lobbying = int(df["lobbying_spend_2023_usd"].sum()) if not df.empty else 0
    highest_risk   = df.loc[df["risk_score"].idxmax(), "name"] if not df.empty else "N/A"

    return {
        "poc_id": 44,
        "rail":  "Distribution & Demand",
        "title": "Location Data Brokerage Map",
        "metric_headline": f"{total_tb // 1000}+ PB/month in circulation",
        "metric_subtext":  "Across tracked broker-SDK network",
        "broker_count":           len(brokers),
        "sdk_vendor_count":       len(sdks),
        "buyer_count":            len(buyers),
        "total_monthly_tb":       total_tb,
        "avg_broker_risk_score":  avg_risk,
        "total_policy_flags":     total_flags,
        "total_lobbying_2023_usd": total_lobbying,
        "highest_risk_entity":    highest_risk,
        "apps_instrumented_est":  86500,
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