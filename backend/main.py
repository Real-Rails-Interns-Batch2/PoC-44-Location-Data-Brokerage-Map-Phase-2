"""
Real Rails PoC 44 — Location Data Brokerage Map
FastAPI Backend: ETL + Data Orchestration
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pandas as pd
import json
import io
from typing import Optional
from data_adapters import (
    get_entities,
    get_relationships,
    get_policy_flags,
    get_sdk_lineage,
    get_summary_metrics,
)

app = FastAPI(
    title="Real Rails — Location Data Brokerage Map API",
    description="PoC 44: Distribution & Demand Rail — Location data broker network intelligence",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"rail": "Location Data Brokerage Map", "poc": 44, "status": "operational"}


@app.get("/api/entities")
def entities(
    category: Optional[str] = Query(None, description="Filter by entity category"),
    use_case: Optional[str] = Query(None, description="Filter by use case tag"),
    granularity: Optional[str] = Query(None, description="Filter by location granularity"),
):
    """
    Returns all broker/vendor/buyer entities.
    Enriched with: market_share_pct, data_volume_monthly_tb, risk_score.
    """
    data = get_entities()
    df = pd.DataFrame(data)

    if category and category.lower() != "all":
        df = df[df["category"].str.lower() == category.lower()]
    if use_case and use_case.lower() != "all":
        df = df[df["use_cases"].apply(lambda tags: use_case.lower() in [t.lower() for t in tags])]
    if granularity and granularity.lower() != "all":
        df = df[df["location_granularity"].str.lower() == granularity.lower()]

    # Intelligence layer: enrich with derived insight
    if not df.empty:
        avg_risk = df["risk_score"].mean()
        if pd.notna(avg_risk) and avg_risk != 0:
            df["risk_vs_avg"] = ((df["risk_score"] - avg_risk) / avg_risk * 100).round(1)
        else:
            df["risk_vs_avg"] = 0.0

        df["risk_label"] = df["risk_score"].apply(
            lambda s: "Critical" if s >= 8 else "Elevated" if s >= 5 else "Moderate"
        )

    # Convert to dict and clean up non-JSON compliant floats (NaN/Inf)
    records = df.to_dict(orient="records")
    for r in records:
        for k, v in r.items():
            # Check for NaN or Inf which crash standard JSON encoders
            if isinstance(v, float) and (v != v or v == float('inf') or v == float('-inf')):
                r[k] = None

    return {"entities": records, "total": len(df)}


@app.get("/api/relationships")
def relationships(
    source_id: Optional[str] = Query(None),
    relationship_type: Optional[str] = Query(None),
):
    """
    Returns entity relationship edges for the network graph.
    Includes data flow direction, volume, and contractual type.
    """
    data = get_relationships()
    df = pd.DataFrame(data)

    if source_id:
        df = df[(df["source"] == source_id) | (df["target"] == source_id)]
    if relationship_type:
        df = df[df["type"].str.lower() == relationship_type.lower()]

    return {"relationships": df.to_dict(orient="records"), "total": len(df)}


@app.get("/api/policy-flags")
def policy_flags():
    """
    Returns CFPB enforcement actions and OpenSecrets lobbying expenditures
    mapped to broker entities. Mock data labeled as synthetic.
    """
    return {"flags": get_policy_flags(), "source_note": "Synthetic mock derived from CFPB/OpenSecrets public records patterns"}


@app.get("/api/sdk-lineage")
def sdk_lineage():
    """
    Returns SDK → App → Broker lineage chain.
    Shows how location data flows from device to downstream buyer.
    """
    return {"lineage": get_sdk_lineage()}


@app.get("/api/summary")
def summary():
    """
    High-level intelligence metrics for sidebar Section A.
    All metrics are derived/enriched, not raw counts.
    """
    return get_summary_metrics()


@app.get("/api/download/sample")
def download_sample():
    """
    Download sample data as CSV for the sidebar Section E button.
    """
    entities = get_entities()
    df = pd.DataFrame(entities)
    # Drop internal fields for clean export
    export_cols = ["id", "name", "category", "location_granularity", "use_cases",
                   "data_volume_monthly_tb", "risk_score", "policy_flags_count", "hq_state"]
    df_export = df[[c for c in export_cols if c in df.columns]]
    df_export["use_cases"] = df_export["use_cases"].apply(lambda x: "|".join(x) if isinstance(x, list) else x)

    stream = io.StringIO()
    df_export.to_csv(stream, index=False)
    stream.seek(0)

    return StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=real_rails_poc44_sample.csv"},
    )
